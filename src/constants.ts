export const STATUS = Object.freeze({
  CONNECTING: 'connecting' as const,
  OPEN: 'open' as const,
  CLOSED: 'closed' as const,
});

export const CLOSE_EVENT_CODE = Object.freeze({
  /**
   * Normal closure, meaning that the purpose for which the connection was established has been fulfilled.
   */
  NORMAL: 1000 as const,
  /**
   * An endpoint is "going away", such as a server going down or a browser having navigated away from a page.
   */
  GOING_AWAY: 1001 as const,
  /**
   * An endpoint is terminating the connection due to a protocol error
   */
  PROTOCOL_ERROR: 1002 as const,
  /**
   * An endpoint is terminating the connection because it has received a type of data it cannot accept
   * (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).
   */
  UNSUPPORTED_DATA: 1003 as const,
  /**
   * Reserved. The specific meaning might be defined in the future.
   */
  RESERVED: 1004 as const,
  /**
   * No status code was actually present.
   */
  NO_STATUS_RESERVED: 1005 as const,
  /**
   * The connection was closed abnormally, e.g., without sending or receiving a Close control frame
   */
  ABNORMAL_CLOSURE_RESERVED: 1006 as const,
  /**
   * An endpoint is terminating the connection because it has received data within a message that was not consistent
   * with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).
   */
  INVALID_FRAME_PAYLOAD_DATA: 1007 as const,
  /**
   * An endpoint is terminating the connection because it has received a message that \"violates its policy\".
   * This reason is given either if there is no other sutible reason, or if there is a need to hide specific
   * details about the policy.
   */
  POLICY_VIOLATION: 1008 as const,
  /**
   * An endpoint is terminating the connection because it has received a message that is too big for it to process.
   */
  MESSAGE_TOO_BIG: 1009 as const,
  /**
   * An endpoint (client) is terminating the connection because it has expected the server to negotiate one
   * or more extension, but the server didn't return them in the response message of the WebSocket handshake.
   */
  MISSING_EXTENSION: 1010 as const,
  /**
   * A server is terminating the connection because it encountered an unexpected condition that prevented it
   * from fulfilling the request.
   */
  INTERNAL_ERROR: 1011 as const,
  SERVICE_RESTART: 1012 as const,
  TRY_AGAIN_LATER: 1013 as const,
  BAD_GATEWAY: 1014 as const,
  /**
   * The connection was closed due to a failure to perform a TLS handshake
   * (e.g., the server certificate can't be verified)
   */
  TLS_HANDSHAKE_RESERVED: 1015 as const,
});
