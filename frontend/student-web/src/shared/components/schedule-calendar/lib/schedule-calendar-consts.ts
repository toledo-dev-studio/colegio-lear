/**
 * Time when calendar days starts in minutes
 * Currently: 06:00 a.m.
 */
export const DAY_START_MIN = 6 * 60;

/**
 * Time when calendar days ends in minutes
 * Currently: 22:00 p.m.
 */
export const DAY_END_MIN = 22 * 60;

/**
 * Minimum duration in minutes of an event
 * Currently: 30 mins for each slot
 */
export const SLOT_MIN = 30;

/**
 * Visual slot height
 * Currently: 30px
 */
export const SLOT_PX = 30;

/**
 * Total slots count for schedule calendar
 */
export const TOTAL_SLOTS = (DAY_END_MIN - DAY_START_MIN) / SLOT_MIN;


export const MIN_BLOCK_MIN = 30;

