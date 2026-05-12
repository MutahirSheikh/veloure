"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { archiveProductAction } from "@/actions/admin/products";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ArchiveProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  function archive() {
    startTransition(async () => {
      const result = await archiveProductAction(productId);
      toast({
        title: result.ok ? "Product archived" : "Archive failed",
        description: result.ok ? result.message : result.error,
        variant: result.ok ? "default" : "destructive"
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Button size="sm" variant="destructive" disabled={isPending} onClick={archive}>
      {isPending ? "Archiving..." : "Archive"}
    </Button>
  );
}
