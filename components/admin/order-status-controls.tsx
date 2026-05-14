"use client";

import * as React from "react";

import { updateOrderAction } from "@/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/brand-loader";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { FULFILLMENT_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import type { OrderWithItems } from "@/lib/db/types";

export function OrderStatusControls({ order }: { order: OrderWithItems }) {
  const { toast } = useToast();
  const [orderStatus, setOrderStatus] = React.useState(order.order_status);
  const [paymentStatus, setPaymentStatus] = React.useState(order.payment_status);
  const [fulfillmentStatus, setFulfillmentStatus] = React.useState(order.fulfillment_status);
  const [adminNote, setAdminNote] = React.useState(order.admin_note ?? "");
  const [historyNote, setHistoryNote] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  function submit() {
    startTransition(async () => {
      const result = await updateOrderAction({
        order_id: order.id,
        order_status: orderStatus,
        payment_status: paymentStatus,
        fulfillment_status: fulfillmentStatus,
        admin_note: adminNote,
        history_note: historyNote
      });
      toast({
        title: result.ok ? "Order updated" : "Order update failed",
        description: result.ok ? result.message : result.error,
        variant: result.ok ? "default" : "destructive"
      });
    });
  }

  return (
    <div className="admin-card overflow-hidden">
      <LoadingOverlay show={isPending} label="Updating order" />
      <div className="border-b border-[#e9edf2] px-6 py-5">
        <h2 className="text-lg font-bold text-[#142044]">Admin Actions</h2>
      </div>
      <div className="grid gap-4 p-6">
        <Select label="Order status" value={orderStatus} onChange={setOrderStatus} values={ORDER_STATUSES} />
        <Select label="Payment status" value={paymentStatus} onChange={setPaymentStatus} values={PAYMENT_STATUSES} />
        <Select label="Fulfillment status" value={fulfillmentStatus} onChange={setFulfillmentStatus} values={FULFILLMENT_STATUSES} />
        <label className="grid gap-2 text-sm">
          Internal admin note
          <Textarea className="rounded-md border-[#d9e0ea]" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm">
          Timeline note
          <Textarea className="rounded-md border-[#d9e0ea]" value={historyNote} onChange={(event) => setHistoryNote(event.target.value)} />
        </label>
        <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]" onClick={submit} disabled={isPending}>
          {isPending ? "Updating..." : "Update order"}
        </Button>
      </div>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  values,
  onChange
}: {
  label: string;
  value: T;
  values: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="admin-input">
        {values.map((item) => (
          <option key={item} value={item}>
            {item.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
