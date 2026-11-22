declare global {
  namespace Express {
    interface Request {
      /** Set by authMiddleware once the session cookie is verified. */
      userId?: number;
    }
  }
}

export {};
