/**
 * Validates req.body / req.query / req.params with a Zod schema.
 * Express 5 makes req.query / req.params read-only getters, so validated
 * values are stored on req.validated[source]. Body is still replaced in place.
 *
 * @param {import("zod").ZodTypeAny} schema
 * @param {"body" | "query" | "params"} source
 */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }

    req.validated ??= {};
    req.validated[source] = result.data;

    if (source === "body") {
      req.body = result.data;
    }

    next();
  };
}

/**
 * @param {import("express").Request} req
 * @param {"body" | "query" | "params"} source
 */
export function validated(req, source = "body") {
  return req.validated?.[source] ?? req[source];
}
