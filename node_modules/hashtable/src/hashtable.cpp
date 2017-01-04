#include "hashtable.h"
#include <iostream>

using namespace v8;

void HashTable::init(Local<Object> target) {
    Nan::HandleScope scope;

    Local<FunctionTemplate> constructor = Nan::New<FunctionTemplate>(Constructor);

    constructor->SetClassName(Nan::New("HashTable").ToLocalChecked());
    constructor->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(constructor, "put", Put);
    Nan::SetPrototypeMethod(constructor, "get", Get);
    Nan::SetPrototypeMethod(constructor, "has", Has);
    Nan::SetPrototypeMethod(constructor, "keys", Keys);
    Nan::SetPrototypeMethod(constructor, "remove", Remove);
    Nan::SetPrototypeMethod(constructor, "clear", Clear);
    Nan::SetPrototypeMethod(constructor, "size", Size);
    Nan::SetPrototypeMethod(constructor, "rehash", Rehash);
    Nan::SetPrototypeMethod(constructor, "reserve", Reserve);
    Nan::SetPrototypeMethod(constructor, "max_load_factor", MaxLoadFactor);
    Nan::SetPrototypeMethod(constructor, "forEach", ForEach);

    target->Set(Nan::New("HashTable").ToLocalChecked(), constructor->GetFunction());
}

HashTable::HashTable() {}

HashTable::HashTable(size_t buckets) : map(buckets) {}

HashTable::~HashTable() {
    for(MapType::const_iterator itr = this->map.begin(); itr != this->map.end(); ) {
        itr->first->Reset();
        itr->second->Reset();

        delete itr->first;
        delete itr->second;

        itr = this->map.erase(itr);
    }
}

NAN_METHOD(HashTable::Constructor) {
    Nan::HandleScope scope;
    HashTable *obj;

    if(info.Length() > 0 && info[0]->IsInt32()) {
        int buckets = info[0]->Int32Value();
        obj = new HashTable(buckets);
    } else {
        obj = new HashTable();
    }

    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
}

NAN_METHOD(HashTable::Get) {
    Nan::HandleScope scope;

    if (info.Length() < 1 || info[0]->IsUndefined() || info[0]->IsNull()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());
    CopyablePersistent *persistent = new Nan::Persistent<Value, Nan::CopyablePersistentTraits<v8::Value> >(info[0]);

    MapType::const_iterator itr = obj->map.find(persistent);
    persistent->Reset();
    delete persistent;

    if(itr == obj->map.end()) {
        info.GetReturnValue().Set(Nan::Undefined());
        return;
    }

    Local<Value> ret = Local<Value>::New(Isolate::GetCurrent(), *itr->second);
    info.GetReturnValue().Set(ret);
    return;
}

NAN_METHOD(HashTable::Has) {
    Nan::HandleScope scope;

    if (info.Length() < 1 || info[0]->IsUndefined() || info[0]->IsNull()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());
    CopyablePersistent *persistent = new Nan::Persistent<Value, Nan::CopyablePersistentTraits<v8::Value> >(info[0]);

    MapType::const_iterator itr = obj->map.find(persistent);
    persistent->Reset();
    delete persistent;

    if(itr == obj->map.end()) {
        info.GetReturnValue().Set(Nan::False());
        return;
    }

    info.GetReturnValue().Set(Nan::True());
    return;
}

NAN_METHOD(HashTable::Put) {
    Nan::HandleScope scope;

    if (info.Length() < 2 || info[0]->IsUndefined() || info[0]->IsNull()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());
    CopyablePersistent *pkey = new CopyablePersistent(info[0]);
    CopyablePersistent *pvalue = new CopyablePersistent(info[1]);

    MapType::const_iterator itr = obj->map.find(pkey);

    //overwriting an existing value
    if(itr != obj->map.end()) {
        itr->first->Reset();
        itr->second->Reset();

        delete itr->first;
        delete itr->second;

        obj->map.erase(itr);
    }

    obj->map.insert(std::pair<CopyablePersistent *, CopyablePersistent *>(pkey, pvalue));

    //Return this
    info.GetReturnValue().Set(info.This());
    return;
}

NAN_METHOD(HashTable::Keys) {
    Nan::HandleScope scope;

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());
    Local<Array> array = Nan::New<Array>();
    Local<Value> val;

    int i = 0;
    for(MapType::const_iterator itr = obj->map.begin(); itr != obj->map.end(); ++itr, ++i) {
        val = Nan::New<Value>(*itr->first);
        Nan::Set(array, i, val);
    }

    info.GetReturnValue().Set(array);
    return;
}

NAN_METHOD(HashTable::Remove) {
    Nan::HandleScope scope;

    if (info.Length() < 1 || info[0]->IsUndefined() || info[0]->IsNull()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());
    CopyablePersistent *persistent = new CopyablePersistent(info[0]);

    MapType::const_iterator itr = obj->map.find(persistent);
    persistent->Reset();
    delete persistent;

    if(itr == obj->map.end()) {
        //do nothing and return false
        info.GetReturnValue().Set(Nan::False());
        return;
    }

    itr->first->Reset();
    itr->second->Reset();

    delete itr->first;
    delete itr->second;

    obj->map.erase(itr);

    info.GetReturnValue().Set(Nan::True());
    return;
}

NAN_METHOD(HashTable::Clear) {
    Nan::HandleScope scope;

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());

    for(MapType::const_iterator itr = obj->map.begin(); itr != obj->map.end(); ) {
        itr->first->Reset();
        itr->second->Reset();

        delete itr->first;
        delete itr->second;

        itr = obj->map.erase(itr);
    }

    info.GetReturnValue().Set(Nan::Undefined());
    return;
}

NAN_METHOD(HashTable::Size) {
    Nan::HandleScope scope;

    HashTable *obj = ObjectWrap::Unwrap<HashTable>(info.This());
    uint32_t size = obj->map.size();

    info.GetReturnValue().Set(Nan::New(size));
    return;

}

NAN_METHOD(HashTable::Rehash) {
    Nan::HandleScope scope;

    if (info.Length() < 1 || !info[0]->IsInt32()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    HashTable *obj = ObjectWrap::Unwrap<HashTable>(info.This());

    size_t buckets = info[0]->Int32Value();

    obj->map.rehash(buckets);

    info.GetReturnValue().Set(Nan::Undefined());
    return;
}

NAN_METHOD(HashTable::Reserve) {
    Nan::HandleScope scope;

    if (info.Length() < 1 || !info[0]->IsInt32()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    HashTable *obj = ObjectWrap::Unwrap<HashTable>(info.This());

    size_t elements = info[0]->Int32Value();

    obj->map.rehash(elements);

    info.GetReturnValue().Set(Nan::Undefined());
    return;
}

NAN_METHOD(HashTable::MaxLoadFactor) {
    Nan::HandleScope scope;

    HashTable *obj = ObjectWrap::Unwrap<HashTable>(info.This());

    double old_factor = obj->map.max_load_factor();
    double factor;

    if(info.Length() > 0 && info[0]->IsInt32()) {
        factor = info[0]->NumberValue();
        if(factor > 0) {
            obj->map.max_load_factor(factor);
        }
    }

    info.GetReturnValue().Set(Nan::New(old_factor));
    return;
}

NAN_METHOD(HashTable::ForEach) {
    Nan::HandleScope scope;

    HashTable *obj = Nan::ObjectWrap::Unwrap<HashTable>(info.This());

    if (info.Length() < 1 || !info[0]->IsFunction()) {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }
    Local<Function> cb = info[0].As<v8::Function>();

    Local<Object> ctx;
    if (info.Length() > 1 && info[1]->IsObject()) {
        ctx = info[1]->ToObject();
    } else {
        ctx = Nan::GetCurrentContext()->Global();
    }

    const unsigned argc = 3;
    Local<Value> argv[argc];
    argv[2] = info.This();

    MapType::const_iterator itr = obj->map.begin();

    while (itr != obj->map.end()) {
        argv[0] = Local<Value>::New(Isolate::GetCurrent(), *itr->first);
        argv[1] = Local<Value>::New(Isolate::GetCurrent(), *itr->second);
        cb->Call(ctx, argc, argv);
        itr++;
    }

    info.GetReturnValue().Set(Nan::Undefined());
    return;
}

extern "C" void
init (Local<Object> target) {
    Nan::HandleScope scope;

    HashTable::init(target);
}

NODE_MODULE(map, init);
