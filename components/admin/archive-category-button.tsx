"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { archiveCategoryAction } from "@/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/brand-loader";
import { useToast } from "@/components/ui/toast";

export function ArchiveCategoryButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  function archive() {
    startTransition(async () => {
      const result = await archiveCategoryAction(categoryId);
      toast({
        title: result.ok ? "Category archived" : "Archive failed",
        description: result.ok ? result.message : result.error,
        variant: result.ok ? "default" : "destructive"
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <>
      <LoadingOverlay show={isPending} label="Archiving category" />
      <Button size="sm" variant="destructive" disabled={isPending} onClick={archive}>
        {isPending ? "Archiving..." : "Archive"}
      </Button>
    </>
  );
}
