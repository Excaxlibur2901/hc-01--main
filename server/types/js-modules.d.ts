declare module './config/database.js' {
  const connectDB: () => Promise<unknown>;
  export default connectDB;
}

declare module './socketHandler.js' {
  import type { Server, Socket } from 'socket.io';

  export function getIO(): Server;
  const socketHandler: (io: Server, socket: Socket) => void;
  export default socketHandler;
}

declare module './routes/tokenRoutes.js' {
  import type { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/doctorRoutes.js' {
  import type { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/summaryRoutes.js' {
  import type { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/emergencyRoutes.js' {
  import type { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './middleware/errorHandler.js' {
  import type { ErrorRequestHandler, RequestHandler } from 'express';

  export const errorHandler: ErrorRequestHandler;
  export const notFoundHandler: RequestHandler;
}

declare module './middleware/rateLimiter.js' {
  import type { RequestHandler } from 'express';

  export const apiLimiter: RequestHandler;
}
