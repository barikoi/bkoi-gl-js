/*
 * bkoi-gl-js Validators
 *
 * This file contains utility functions for validating Barikoi-specific inputs,
 * such as checking if a map style URL is a Barikoi style.
 *
 * These validators help ensure proper integration with Barikoi services.
 */

export function isBarikoiStyle(style) {
    if(typeof style === 'string' && style.includes('barikoi.com')) {
        return true
    }

    return false
}