module.exports = async (ctx, next) => {
  if (ctx.state.user) {
    // User is authenticated
    return await next();
  }

  // User is not authenticated
  return ctx.unauthorized("You must be logged in to access this resource.");
};
