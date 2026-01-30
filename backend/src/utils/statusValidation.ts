/**
 * Transaction status validation utilities
 * Implements state machine to ensure valid status transitions
 */

export type TransactionStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';

/**
 * Valid status transitions for hawala transactions
 * Maps current status to allowed next statuses
 */
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  pending: ['in_transit', 'cancelled'],
  in_transit: ['completed', 'cancelled'],
  completed: [], // Terminal state - no further transitions allowed
  cancelled: []  // Terminal state - no further transitions allowed
};

/**
 * Validate if a status transition is allowed
 * @param currentStatus Current transaction status
 * @param newStatus Desired new status
 * @returns true if transition is valid, false otherwise
 */
export function isValidStatusTransition(
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus
): boolean {
  // Allow same status (no-op)
  if (currentStatus === newStatus) {
    return true;
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

/**
 * Get allowed next statuses for a given current status
 * @param currentStatus Current transaction status
 * @returns Array of allowed next statuses
 */
export function getAllowedNextStatuses(currentStatus: TransactionStatus): TransactionStatus[] {
  return VALID_TRANSITIONS[currentStatus];
}

/**
 * Get human-readable error message for invalid transition
 * @param currentStatus Current transaction status
 * @param newStatus Desired new status
 * @returns Error message
 */
export function getInvalidTransitionMessage(
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus
): string {
  const allowed = getAllowedNextStatuses(currentStatus);

  if (allowed.length === 0) {
    return `Transaction is ${currentStatus} and cannot be changed.`;
  }

  return `Cannot change status from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowed.join(', ')}.`;
}
