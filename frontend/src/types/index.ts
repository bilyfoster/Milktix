export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  quantityRemaining: number;
  minPerOrder: number;
  maxPerOrder: number;
  isAvailable: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  status: string;
  eventType: string;
  imageUrl: string | null;
  organizer: {
    id: string;
    fullName: string;
  };
  ticketTypes: TicketType[];
  categories: Category[];
  isUpcoming: boolean;
  isPast: boolean;
}

export interface OrderItem {
  ticketTypeId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  eventId: string;
  items: OrderItem[];
  billingName: string;
  billingEmail: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  ticketType: {
    id: string;
    name: string;
    price: number;
  };
  attendeeName: string;
  attendeeEmail: string;
  status: string;
  qrCodeData: string;
  checkedInAt: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  event: {
    id: string;
    title: string;
    startDateTime: string;
    venueName: string;
  };
  tickets: Ticket[];
  subtotal: number;
  taxAmount: number;
  feeAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  billingName: string;
  billingEmail: string;
  createdAt: string;
}