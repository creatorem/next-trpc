import z, { type Schema } from "zod";
import type { NextRequest } from "next/server";

export type Endpoint<
  Output,
  Input extends Schema | undefined = undefined,
  Ctx = {}
> = {
  input?: Input;
  action: Input extends undefined
    ? (
        context: {
          request: NextRequest;
        } & Ctx
      ) => Output
    : (
        input: Input extends Schema ? z.infer<Input> : Input,
        context: {
          request: NextRequest;
        } & Ctx
      ) => Output;
};

export const endpoint = {
  input: <Input extends Schema>(schema: Input) => ({
    action: <Output, Ctx = {}>(
      actionFn: Endpoint<Output, Input, Ctx>["action"]
    ): Endpoint<Output, Input, Ctx> => ({
      input: schema,
      action: actionFn,
    }),
  }),
  action: <Output, Ctx = {}>(
    actionFn: Endpoint<Output, undefined, Ctx>["action"]
  ): Endpoint<Output, undefined, Ctx> => ({
    action: actionFn,
  }),
};

export type Router<Ctx> = Record<string, Endpoint<any, any, Ctx>>;

export const router = <Ctx, R extends Router<Ctx>>(r: R) => r;

export class CtxRouter<Ctx> {
  public endpoint = {
    input: <Input extends Schema>(schema: Input) => ({
      action: <Output>(
        actionFn: Endpoint<Output, Input, Ctx>["action"]
      ): Endpoint<Output, Input, Ctx> => ({
        input: schema,
        action: actionFn,
      }),
    }),
    action: <Output>(
      actionFn: Endpoint<Output, undefined, Ctx>["action"]
    ): Endpoint<Output, undefined, Ctx> => ({
      action: actionFn,
    }),
  };

  public router<R extends Router<Ctx>>(r: R) {
    return r;
  }
}
