import { GraphError } from "./types";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export class GraphClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async fetch(
    path: string,
    options: {
      useImmutableId?: boolean;
      preferTextBody?: boolean;
      retryCount?: number;
    } = {}
  ): Promise<Response> {
    const { useImmutableId = true, preferTextBody = false, retryCount = 0 } =
      options;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    };

    const preferValues: string[] = [];
    if (useImmutableId) {
      preferValues.push('IdType="ImmutableId"');
    }
    if (preferTextBody) {
      preferValues.push('outlook.body-content-type="text"');
    }
    if (preferValues.length > 0) {
      headers["Prefer"] = preferValues.join(", ");
    }

    const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;

    const response = await fetch(url, { headers });

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && retryCount < 3) {
      const retryAfter = response.headers.get("Retry-After");
      const delayMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(1000 * Math.pow(2, retryCount), 30000);
      console.warn(
        `[graph] Rate limited (429). Retrying in ${delayMs}ms (attempt ${retryCount + 1}/3)`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return this.fetch(path, { ...options, retryCount: retryCount + 1 });
    }

    if (response.status >= 500 && retryCount < 2) {
      const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.warn(
        `[graph] Server error (${response.status}). Retrying in ${delayMs}ms (attempt ${retryCount + 1}/2)`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return this.fetch(path, { ...options, retryCount: retryCount + 1 });
    }

    const error = await this.parseError(response);
    throw error;
  }

  private async parseError(response: Response): Promise<GraphError> {
    try {
      const body = await response.json();
      return {
        code: body?.error?.code ?? "UnknownError",
        message: body?.error?.message ?? "An unknown error occurred",
        statusCode: response.status,
      };
    } catch {
      return {
        code: "ParseError",
        message: `HTTP ${response.status} ${response.statusText}`,
        statusCode: response.status,
      };
    }
  }
}
