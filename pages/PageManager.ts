import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { InventoryPage } from './InventoryPage';
import { CartPage } from './CartPage';
import { CheckoutInformationPage } from './CheckoutInformationPage';
import { CheckoutOverviewPage } from './CheckoutOverviewPage';
import { CheckoutCompletePage } from './CheckoutCompletePage';
import { DummyBookingLoginPage } from './DummyBookingLoginPage';
import { FlightSearchPage } from './FlightSearchPage';
import { BookingFlowPage } from './BookingFlowPage';

export class PageManager {
  readonly login: LoginPage;
  readonly inventory: InventoryPage;
  readonly cart: CartPage;
  readonly checkoutInformation: CheckoutInformationPage;
  readonly checkoutOverview: CheckoutOverviewPage;
  readonly checkoutComplete: CheckoutCompletePage;
  readonly dummyBookingLogin: DummyBookingLoginPage;
  readonly flightSearch: FlightSearchPage;
  readonly bookingFlow: BookingFlowPage;

  constructor(page: Page) {
    this.login = new LoginPage(page);
    this.inventory = new InventoryPage(page);
    this.cart = new CartPage(page);
    this.checkoutInformation = new CheckoutInformationPage(page);
    this.checkoutOverview = new CheckoutOverviewPage(page);
    this.checkoutComplete = new CheckoutCompletePage(page);
    this.dummyBookingLogin = new DummyBookingLoginPage(page);
    this.flightSearch = new FlightSearchPage(page);
    this.bookingFlow = new BookingFlowPage(page);
  }
}
