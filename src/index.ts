import { authenticate, submitChallenge } from "./auth.ts";
import RobinhoodApi from "./api.ts";
import {
  AuthResponse,
  AuthResponseAwaitingInput,
  AuthResponseError,
  AuthResponseSuccess,
} from "./types.ts";

// ✅ Export `submitChallenge` explicitly
export { submitChallenge };

export type RobinhoodCredentials = {
  username?: string;
  password?: string;
  token?: string;
};

export default async function Robinhood(
  credentials: RobinhoodCredentials
): Promise<AuthResponse> {
  try {
    let authResponse;

    if (credentials.token) {
      console.log("✅ Using provided token...");
      authResponse = { tokenData: { access_token: credentials.token } };
    } else {
      // ✅ Start authentication
      authResponse = await authenticate(credentials);

      if (authResponse.status === "awaiting_input") {
        let authType = "unknown";

        if (
          authResponse.message.includes("SMS") ||
          authResponse.message.includes("Authenticator")
        ) {
          authType = "mfa";
        } else if (authResponse.message.includes("Confirm device approval")) {
          authType = "device_confirmation";
        }

        return {
          status: "awaiting_input",
          workflow_id: authResponse.workflow_id,
          message: authResponse.message,
          authType, // ✅ Now includes what type of authentication is needed
        } as AuthResponseAwaitingInput;
      }

      if (
        authResponse.status !== "success" ||
        !authResponse.tokenData.access_token
      ) {
        return {
          status: "error",
          message: `❌ Authentication failed!: ${authResponse.message}`,
        } as AuthResponseError;
      }

      console.log("✅ Authentication successful!");
    }

    // ✅ Always ensure API instance is included
    const apiInstance = new RobinhoodApi(authResponse.tokenData.access_token);

    return {
      status: "success",
      tokenData: authResponse.tokenData,
      api: apiInstance,
    } as AuthResponseSuccess;
  } catch (error) {
    console.error("🚨 Robinhood Error:", error);
    throw error;
  }
}
