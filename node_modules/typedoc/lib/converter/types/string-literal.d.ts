import * as ts from "typescript";
import { StringLiteralType } from "../../models/types/index";
import { ConverterTypeComponent, ITypeConverter } from "../components";
import { Context } from "../context";
export declare class StringLiteralConverter extends ConverterTypeComponent implements ITypeConverter<ts.StringLiteralType, ts.StringLiteral> {
    supportsNode(context: Context, node: ts.StringLiteral): boolean;
    supportsType(context: Context, type: ts.StringLiteralType): boolean;
    convertNode(context: Context, node: ts.StringLiteral): StringLiteralType;
    convertType(context: Context, type: ts.StringLiteralType): StringLiteralType;
}
