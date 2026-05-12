"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { adjustInventoryAction } from "@/actions/admin/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { InventoryRow } from "@/lib/queries/admin";

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const { toast } = useToast();
  const [amounts, setAmounts] = React.useState<Record<string, number>>({});

  function adjust(variantId: string, direction: 1 | -1) {
    const amount = Math.abs(amounts[variantId] ?? 1) * direction;
    React.startTransition(async () => {
      const result = await adjustInventoryAction({
        variant_id: variantId,
        change_amount: amount,
        reason: direction > 0 ? "Manual restock" : "Manual correction"
      });
      toast({
        title: result.ok ? "Inventory adjusted" : "Adjustment failed",
        description: result.ok ? `New stock: ${result.data.stock}` : result.error,
        variant: result.ok ? "default" : "destructive"
      });
    });
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Option</th>
            <th>Stock</th>
            <th>Low stock</th>
            <th>Adjust</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="font-medium">{row.product.name}</td>
              <td>{row.sku}</td>
              <td>{row.color} / {row.size}</td>
              <td className={row.stock_quantity <= row.low_stock_threshold ? "font-bold text-destructive" : "font-medium"}>{row.stock_quantity}</td>
              <td>{row.low_stock_threshold}</td>
              <td>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-20"
                    type="number"
                    min="1"
                    value={amounts[row.id] ?? 1}
                    onChange={(event) => setAmounts((current) => ({ ...current, [row.id]: Number(event.target.value) }))}
                  />
                  <Button size="icon" variant="outline" onClick={() => adjust(row.id, -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => adjust(row.id, 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted-foreground">
                No variants found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
