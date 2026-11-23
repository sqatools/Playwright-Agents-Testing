# Dummy Booking Website Comprehensive Test Plan

## Application Overview

Comprehensive positive, negative, boundary, and end-to-end test coverage for the SQA Tools dummy flight booking website at https://sqatools.in/dummy-booking-website/. Assumes a fresh browser session for every scenario unless a test explicitly verifies session persistence. All passenger and payment values are dummy data; no real personal or financial details are used.

## Test Scenarios

### 1. Authentication

**Seed:** `test/seed.spec.ts`

#### 1.1. Valid user login succeeds and reveals the booking flow

**File:** `test/dummy-booking/authentication.spec.ts`

**Steps:**
  1. Open the website in a fresh browser session.
    - expect: The page title is “Dummy Flight Booking Website For Automation Practice | SQA Tools”.
    - expect: The login card is visible.
    - expect: The “Logged in as” state is not visible.
  2. Enter testuser as the username and Test@123 as the password.
    - expect: Both values appear in their fields.
  3. Select Log in.
    - expect: A “Signed in as Test User” message appears.
    - expect: The Log out control is visible.
    - expect: Step 1 Search is active and the flight search form is visible.

#### 1.2. Locked user cannot sign in

**File:** `test/dummy-booking/authentication.spec.ts`

**Steps:**
  1. Open the website and enter lockeduser and Test@123.
    - expect: The credentials are accepted into the login fields.
  2. Select Log in.
    - expect: The user remains on the login state.
    - expect: An authentication error is displayed.
    - expect: The flight search flow is not displayed.

#### 1.3. Invalid and empty login credentials show validation

**File:** `test/dummy-booking/authentication.spec.ts`

**Steps:**
  1. Submit the login form with both fields empty.
    - expect: A clear required-field or invalid-credentials error is displayed.
  2. Enter an unknown username with a valid-looking password.
    - expect: Login is rejected and the search form remains hidden.
  3. Enter testuser with an incorrect password.
    - expect: Login is rejected and the password is not exposed.

#### 1.4. Password visibility toggle and Remember me work

**File:** `test/dummy-booking/authentication.spec.ts`

**Steps:**
  1. Enter testuser and Test@123, verify Remember me is unchecked, then select Show.
    - expect: The password field changes to text and exposes the entered password.
    - expect: The Show control changes to Hide.
  2. Select Hide.
    - expect: The password field returns to password masking.
  3. Check Remember me and sign in successfully, then reload the page.
    - expect: The signed-in state or remembered username behavior persists according to the implemented expectation.

#### 1.5. Logout returns to the login state

**File:** `test/dummy-booking/authentication.spec.ts`

**Steps:**
  1. Sign in with testuser and Test@123.
    - expect: The booking flow is visible.
  2. Select Log out.
    - expect: The login card returns.
    - expect: Search and logged-in controls are hidden.
    - expect: A subsequent search cannot proceed without signing in again.

### 2. Flight Search

**Seed:** `test/seed.spec.ts`

#### 2.1. Successful one-way search for a valid domestic route

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Sign in and select Delhi as origin and Mumbai as destination.
    - expect: Both selections are valid and different.
  2. Choose a future departure date within the displayed date range.
    - expect: The departure date is accepted.
  3. Select Economy, 1 adult, 0 children, and 0 infants.
    - expect: Traveller and cabin values are set correctly.
  4. Leave Non-stop only unchecked and select Search flights.
    - expect: Search results appear.
    - expect: A list of available flights is shown.
    - expect: Origin, destination, and search criteria are represented in the results.

#### 2.2. Successful round-trip search requires a valid return date

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Sign in and select round trip.
    - expect: The return date field becomes active and is available for entry.
  2. Select Mumbai to Bengaluru, a future departure date, and a later future return date.
    - expect: Both date values are accepted.
    - expect: The return date is not before the departure date.
  3. Select Search flights.
    - expect: Round-trip search results or the appropriate outbound/return booking flow is displayed.
    - expect: Search criteria remain accurate.

#### 2.3. Same origin and destination are rejected

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Sign in and select Delhi for both origin and destination.
    - expect: The two city fields contain the same airport.
  2. Enter valid future dates and select Search flights.
    - expect: Search is prevented.
    - expect: A same-city route validation message is shown.

#### 2.4. Missing required route fields are rejected

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Leave origin, destination, and dates empty, then search.
    - expect: The search form remains open.
    - expect: Required-field validation is shown for each missing search value.
  2. Fill only the origin and search again.
    - expect: Remaining origin/destination/date requirements are identified without searching.

#### 2.5. Past and out-of-range departure dates are not accepted

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Attempt to enter a past date or a date more than one year beyond today.
    - expect: The browser date control prevents entry or the application rejects the date.
    - expect: No search results are produced.
  2. Search with a past date if automation bypasses the native control.
    - expect: Application validation is shown and booking does not continue.

#### 2.6. Round-trip return date cannot precede departure date

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Select round trip and choose a departure date later than a selected return date.
    - expect: Return-date validation identifies the invalid date relationship.
    - expect: Search cannot proceed.

#### 2.7. City swap reverses origin and destination

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Select Delhi as origin and Mumbai as destination.
    - expect: The two city fields contain the selected values.
  2. Select the swap button.
    - expect: Delhi is now the destination and Mumbai is the origin.
    - expect: The search remains editable.

#### 2.8. Cabin class and maximum traveller counts are handled

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Select Business class and the maximum allowed 9 adults, 8 children, and 4 infants.
    - expect: All selections are accepted by the controls.
  2. Submit a search from a valid route.
    - expect: The search flow continues and traveller/cabin criteria are preserved.
    - expect: The UI does not create invalid passenger counts or crash.

#### 2.9. Non-stop filter removes flights with stops

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Perform a valid route search with Non-stop only unchecked.
    - expect: At least one result set is displayed.
  2. Enable Non-stop only and search again.
    - expect: Returned flights are marked nonstop.
    - expect: The results do not include connecting flights if such variants are available.

#### 2.10. Modify search resets or restores the expected state

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Complete a valid search and open results.
    - expect: The results view is visible.
  2. Select Modify search.
    - expect: The search form is visible with previous selections restored or clearly editable.
    - expect: No stale result selection is retained.

#### 2.11. Search result sorting orders records correctly

**File:** `test/dummy-booking/flight-search.spec.ts`

**Steps:**
  1. Complete a valid search that returns multiple flights.
    - expect: Multiple sortable flight records are displayed.
  2. Sort by Lowest price, Earliest departure, and Shortest duration.
    - expect: The lowest price sort produces ascending fares.
    - expect: Departure times appear in ascending order.
    - expect: Durations appear in ascending order.
    - expect: The displayed result count remains unchanged.

### 3. Flight and Seat Selection

**Seed:** `test/seed.spec.ts`

#### 3.1. Select a flight and advance to passenger details

**File:** `test/dummy-booking/flight-selection.spec.ts`

**Steps:**
  1. Sign in, complete a valid one-way search, and select an available flight.
    - expect: The selected flight is highlighted or clearly identified.
    - expect: The booking proceeds to the passenger-details step.
    - expect: The six-step progress indicator advances from Search to Select flight.
  2. Proceed to passenger details.
    - expect: Required passenger fields appear for the selected traveller count.
    - expect: Contact fields and optional preferences are visible.

#### 3.2. No flight selection does not advance

**File:** `test/dummy-booking/flight-selection.spec.ts`

**Steps:**
  1. Complete a valid search and remain on the results view without choosing a flight.
    - expect: No selection is considered complete.
  2. Attempt to use the next action if available.
    - expect: The application prevents advancement and prompts for flight selection.

#### 3.3. Dummy passenger details fill and remain editable

**File:** `test/dummy-booking/flight-selection.spec.ts`

**Steps:**
  1. At passenger details, select Fill dummy details.
    - expect: Passenger name and contact dummy values populate.
    - expect: Generated values are within the page's displayed formats.
  2. Edit one generated field.
    - expect: The edited value remains when navigating forward or back.
    - expect: There is no unintended reset.

#### 3.4. Passenger validation rejects missing and malformed values

**File:** `test/dummy-booking/flight-selection.spec.ts`

**Steps:**
  1. Clear all passenger fields and continue.
    - expect: Required passenger-field errors are displayed.
    - expect: No progression to seat selection occurs.
  2. Enter invalid email and phone formats.
    - expect: Email and 10-digit phone validation reject malformed values.
    - expect: Valid formats are accepted.
  3. Enter numeric or symbol-only names where validation is intended.
    - expect: Name validation rejects invalid values if the application enforces it.

#### 3.5. Contact country code and phone selection

**File:** `test/dummy-booking/flight-selection.spec.ts`

**Steps:**
  1. Select each available contact country code and enter a 10-digit compatible phone number.
    - expect: The selected country code remains associated with the contact field.
    - expect: The form accepts or reports only its defined phone constraints.

#### 3.6. Auto-assign seats for all passengers

**File:** `test/dummy-booking/seat-selection.spec.ts`

**Steps:**
  1. Complete passenger details and continue to seats.
    - expect: Seat selection opens for the correct number of passengers.
  2. Select Auto-assign free seats.
    - expect: A seat is assigned to every passenger.
    - expect: Assigned seats are unique.
    - expect: Continue to payment becomes available.

#### 3.7. Manual seat selection cannot assign duplicates or unavailable seats

**File:** `test/dummy-booking/seat-selection.spec.ts`

**Steps:**
  1. Open manual seat selection.
    - expect: Occupied or unavailable seats are disabled and free seats are selectable.
  2. Select a free seat for one passenger.
    - expect: The seat appears assigned to that passenger.
    - expect: The same seat cannot be assigned to another passenger.

#### 3.8. Continue from seats validates missing assignments

**File:** `test/dummy-booking/seat-selection.spec.ts`

**Steps:**
  1. Open seats for multiple passengers and leave at least one passenger unassigned.
    - expect: Continue to payment is blocked or a validation message identifies missing assignments.
    - expect: The user remains on seat selection.

#### 3.9. Back navigation preserves passenger and seat choices

**File:** `test/dummy-booking/seat-selection.spec.ts`

**Steps:**
  1. Enter passenger details, continue to seats, assign seats, then navigate Back.
    - expect: Passenger values remain populated.
    - expect: Returning forward restores assigned seats where the flow supports state retention.

### 4. Payment

**Seed:** `test/seed.spec.ts`

#### 4.1. Successful card payment completes the booking

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Complete search, flight selection, passenger details, and seat assignment.
    - expect: Payment step displays the booking summary and fare.
    - expect: Card payment is selected by default.
  2. Enter the test card name, 4111 1111 1111 1111, a future expiry, and CVV 123.
    - expect: Card fields accept valid dummy values.
    - expect: Payment can proceed.
  3. Accept terms and select Pay now.
    - expect: The confirmation step appears.
    - expect: A success message and booking reference are displayed.
    - expect: The amount paid and passenger/flight details match the booking.

#### 4.2. Declined card produces an error and preserves booking context

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Complete the booking flow and enter card 4000 0000 0000 0002 with valid future expiry and CVV.
    - expect: The declined test card is recognized.
  2. Accept terms and pay.
    - expect: A declined-payment message is shown.
    - expect: No confirmation or success booking reference is created.
    - expect: Passenger, flight, and seat selections remain available for retry.

#### 4.3. Card payment validates required and malformed fields

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Leave card fields empty and attempt to pay.
    - expect: Each required card field is validated.
    - expect: Payment is not submitted.
  2. Enter an invalid card number, expired or malformed expiry, and CVV outside 3 digits.
    - expect: Card number, expiry, and CVV validation reject the values.
    - expect: The form remains on payment.

#### 4.4. Successful UPI payment completes the booking

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Complete the booking to payment and select UPI.
    - expect: UPI fields replace or supplement card fields.
    - expect: Card fields are hidden or inactive.
  2. Enter success@upi, accept terms, and pay.
    - expect: Payment succeeds.
    - expect: Confirmation displays the correct UPI payment method and booking summary.

#### 4.5. Failed UPI payment returns a decline error

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Select UPI and enter failure@upi.
    - expect: UPI ID is accepted as a valid test format.
  2. Pay.
    - expect: A payment-failure or UPI-decline message is shown.
    - expect: Confirmation is not reached.

#### 4.6. UPI validates malformed and empty identifiers

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Leave UPI empty or enter text without the expected UPI structure.
    - expect: A required-field or format message is displayed.
    - expect: Payment is blocked.

#### 4.7. Net banking selection and bank validation

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Select net banking and leave the bank unselected.
    - expect: No payment proceeds until a bank is selected.
  2. Select each available demo bank.
    - expect: The bank selection is retained.
    - expect: A valid test payment can proceed according to the page behavior.

#### 4.8. Promo code SQA100 applies exactly once

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Proceed to payment with a visible base fare and enter SQA100.
    - expect: The promo code is entered.
  2. Select Apply.
    - expect: A ₹100 discount is applied.
    - expect: The total and discount line are updated consistently.
    - expect: The price is reduced by exactly ₹100.
  3. Apply SQA100 again.
    - expect: The application prevents duplicate discount application or keeps the total unchanged.
    - expect: The UI gives clear feedback.

#### 4.9. Invalid, blank, and case variations of promo codes

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Leave the promo field blank and select Apply.
    - expect: Required or invalid-promo feedback is shown.
    - expect: Fare remains unchanged.
  2. Enter an unsupported code such as NOTACODE.
    - expect: The code is rejected without changing the total.
  3. Enter different capitalization or whitespace for SQA100.
    - expect: The application either applies it consistently per stated rules or clearly reports invalid formatting.
    - expect: No unhandled UI state occurs.

#### 4.10. Terms acceptance is mandatory

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. Complete valid payment information but leave Accept terms unchecked.
    - expect: Pay now is blocked or validation identifies the terms checkbox.
    - expect: No success confirmation is created.
  2. Check terms and pay.
    - expect: Payment proceeds normally.

#### 4.11. Back navigation from payment preserves selections

**File:** `test/dummy-booking/payment.spec.ts`

**Steps:**
  1. From payment, navigate Back to seats or passenger details.
    - expect: Payment method and entered dummy values remain populated if intended.
    - expect: Flight, passenger, and seat selections remain consistent.
    - expect: No duplicate booking or charge-like action occurs.

### 5. Confirmation and Cross-Flow Behavior

**Seed:** `test/seed.spec.ts`

#### 5.1. Complete one-way booking end to end

**File:** `test/dummy-booking/end-to-end.spec.ts`

**Steps:**
  1. Sign in, search Delhi to Mumbai for a future date, select a flight, add passenger/contact details, auto-assign seats, pay with the success card, and accept terms.
    - expect: Every step advances in sequence.
    - expect: A confirmation page is reached.
    - expect: A unique booking reference, route, date, traveller, seat, fare, and payment method are displayed consistently.

#### 5.2. Complete round-trip booking end to end

**File:** `test/dummy-booking/end-to-end.spec.ts`

**Steps:**
  1. Sign in and complete a round-trip search with valid departure and return dates.
    - expect: Search reflects both dates and the round-trip choice.
  2. Complete flight, passenger, seat, and successful payment steps.
    - expect: Confirmation includes outbound and return information or clearly reflects the round-trip booking.
    - expect: Fares and totals are consistent with the selected itinerary.

#### 5.3. Confirmation provides accurate final summary

**File:** `test/dummy-booking/confirmation.spec.ts`

**Steps:**
  1. Complete a successful card or UPI booking.
    - expect: Confirmation heading and booking reference are visible.
    - expect: Traveller count and passenger names match entered values.
    - expect: Route, travel dates, cabin, seats, fare, discount, and payment method match prior steps.

#### 5.4. Logout or refresh after confirmation does not create a second booking

**File:** `test/dummy-booking/confirmation.spec.ts`

**Steps:**
  1. Complete a booking and log out.
    - expect: Logout returns to login state.
    - expect: The previous booking cannot be submitted again from stale controls.
  2. Reload the confirmation page or start a fresh browser session.
    - expect: The application shows the login/search state or a safe history state.
    - expect: It does not duplicate or charge for a prior booking.

#### 5.5. Core flow remains usable on desktop, tablet, and mobile viewports

**File:** `test/dummy-booking/responsive.spec.ts`

**Steps:**
  1. Repeat login and search at 1920x1080, 768x1024, and 375x812 viewports.
    - expect: There is no horizontal overflow.
    - expect: Controls are reachable and remain identifiable.
    - expect: Dialogs, dropdowns, date inputs, and step navigation remain usable.
  2. Complete a short booking on the mobile viewport.
    - expect: Passenger, seat, payment, and confirmation views remain readable.
    - expect: No controls overlap or require accidental horizontal scrolling.

#### 5.6. Browser back and forward do not corrupt booking state

**File:** `test/dummy-booking/resilience.spec.ts`

**Steps:**
  1. Move through search, selection, passenger, seat, and payment states.
    - expect: Back navigation returns to a prior valid step.
  2. Use browser Forward and return to an already-completed step.
    - expect: Previously entered values and selected options remain consistent.
    - expect: The application blocks impossible transitions or stale submissions.
    - expect: No duplicate booking confirmation is created.

#### 5.7. Rapid repeated submission does not create duplicate confirmation

**File:** `test/dummy-booking/resilience.spec.ts`

**Steps:**
  1. On payment, double-click or rapidly activate Pay now after valid details are entered.
    - expect: The application processes one booking only.
    - expect: No duplicate booking reference or repeated confirmation is produced.
    - expect: The UI provides a stable processing or success state.

#### 5.8. Session does not leak between users

**File:** `test/dummy-booking/resilience.spec.ts`

**Steps:**
  1. Sign in as testuser, start a booking, log out, and sign in again in the same browser.
    - expect: The new login is clean.
    - expect: Personal, passenger, selected route, seat, or payment data from the prior session is cleared or is never exposed to another user.

#### 5.9. Page refresh during search and booking preserves or safely resets state

**File:** `test/dummy-booking/resilience.spec.ts`

**Steps:**
  1. Refresh at login, search, passenger, seat, and payment states.
    - expect: State is handled consistently and safely.
    - expect: The application does not continue to confirmation from an incomplete booking.
    - expect: Any reset is communicated and no stale personal or payment data remains.

#### 5.10. Keyboard-only navigation reaches login and booking controls

**File:** `test/dummy-booking/accessibility.spec.ts`

**Steps:**
  1. Open the page and navigate with Tab, Shift+Tab, Enter, and Space.
    - expect: All interactive controls have a logical focus order.
    - expect: Focus is visible.
    - expect: Radio buttons, checkboxes, dropdowns, and date fields operate with keyboard input.
    - expect: Dialogs or validation states expose focus correctly.

#### 5.11. Labels and validation are accessible

**File:** `test/dummy-booking/accessibility.spec.ts`

**Steps:**
  1. Inspect form fields and trigger validation errors.
    - expect: Fields have visible or programmatically associated labels.
    - expect: Errors identify the affected field.
    - expect: Password masking and Show/Hide behavior are announced appropriately.
    - expect: Status and error changes are perceivable by assistive technology.
