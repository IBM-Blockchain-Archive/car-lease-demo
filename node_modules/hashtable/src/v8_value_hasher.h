#ifndef V8_VALUE_HASHER_H
#define V8_VALUE_HASHER_H

#include <string>
#include <iostream>
#include <node.h>
#ifdef __APPLE__
#include <tr1/unordered_set>
#define hash std::tr1::hash
#else
#include <unordered_set>
#define hash std::hash
#endif

typedef Nan::Persistent<v8::Value, Nan::CopyablePersistentTraits<v8::Value> > CopyablePersistent;

struct v8_value_hash
{
    size_t operator()(CopyablePersistent *k) const {
        Nan::HandleScope scope;
        v8::Local<v8::Value> key = v8::Local<v8::Value>::New(v8::Isolate::GetCurrent(), *k);

        std::string s;
        if (key->IsString() || key->IsBoolean() || key->IsNumber()) {
            return hash<std::string>()(*Nan::Utf8String(key));
        }
        return hash<int>()(Nan::To<v8::Object>(key).ToLocalChecked()->GetIdentityHash());
    }
};

struct v8_value_equal_to
{
    bool operator()(CopyablePersistent *pa, CopyablePersistent *pb) const {
        Nan::HandleScope scope;

        if (*pa == *pb) {
            return true;
        }

        v8::Local<v8::Value> a = v8::Local<v8::Value>::New(v8::Isolate::GetCurrent(), *pa);
        v8::Local<v8::Value> b = v8::Local<v8::Value>::New(v8::Isolate::GetCurrent(), *pb);

        if (a->Equals(b)) {          /* same as JS == */
            return true;
        }

        return Nan::To<v8::Object>(a).ToLocalChecked()->GetIdentityHash() == Nan::To<v8::Object>(b).ToLocalChecked()->GetIdentityHash();
    }
};

#endif
