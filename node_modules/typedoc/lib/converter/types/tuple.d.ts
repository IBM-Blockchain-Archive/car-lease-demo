import * as ts from "typescript";
import { TupleType } from "../../models/types/index";
import { ConverterTypeComponent, ITypeConverter } from "../components";
import { Context } from "../context";
export declare class TupleConverter extends ConverterTypeComponent implements ITypeConverter<ts.TupleType, ts.TupleTypeNode> {
    supportsNode(context: Context, node: ts.TupleTypeNode): boolean;
    supportsType(context: Context, type: ts.TupleType): boolean;
    convertNode(context: Context, node: ts.TupleTypeNode): TupleType;
    convertType(context: Context, type: ts.TupleType): TupleType;
}
