import type { Product } from "@/data/products";

export type Customer = {
  nome: string;
  email: string;
  whatsapp: string;
};

export type OrderStatus =
  | "aguardando_pagamento"
  | "pagamento_aprovado"
  | "pagamento_recusado"
  | "cancelado";

export type Order = {
  id: string;
  data: string;
  cliente: Customer;
  produtos: Product[];
  total: number;
  status: OrderStatus;
};