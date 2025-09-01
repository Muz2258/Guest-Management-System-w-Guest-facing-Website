export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dietaryRestrictions?: string;
  invitationSent: boolean;
  invitationAccepted?: boolean;
  plusOneAllowed: boolean;
  plusOneName?: string;
  tableNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RSVP {
  id: string;
  guestId: string;
  attending: boolean;
  plusOneAttending?: boolean;
  dietaryRestrictions?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  guestId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}
