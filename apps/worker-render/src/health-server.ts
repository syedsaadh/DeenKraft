import { createServer, type IncomingMessage, type ServerResponse } from 'http';

export interface WorkerHealthState {
  isReady: boolean;
  isAlive: boolean;
  queueName: string;
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
}

function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  getState: () => WorkerHealthState,
) {
  const path = request.url ?? '/';
  const state = getState();

  if (path === '/health/live') {
    writeJson(response, 200, {
      status: state.isAlive ? 'alive' : 'down',
      queueName: state.queueName,
    });
    return;
  }

  if (path === '/health/ready') {
    if (state.isReady) {
      writeJson(response, 200, {
        status: 'ready',
        queueName: state.queueName,
      });
      return;
    }

    writeJson(response, 503, {
      status: 'not-ready',
      queueName: state.queueName,
    });
    return;
  }

  writeJson(response, 404, { status: 'not-found' });
}

export function createHealthServer(
  port: number,
  getState: () => WorkerHealthState,
) {
  const server = createServer((request, response) => {
    routeRequest(request, response, getState);
  });

  return {
    start: () =>
      new Promise<void>((resolve) => {
        server.listen(port, () => resolve());
      }),
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}
