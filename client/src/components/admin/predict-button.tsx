"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui";
import { redirect } from "next/navigation";

export function PredictButton({
  id,
  token,
  disabled,
  applicants,
}: {
  id: number;
  applicants: number;
  token: string;
  disabled: boolean | null;
}) {
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["predict", id],
    mutationFn: async (jobId: number) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/predict`, {
        method: "POST",
        body: JSON.stringify({ jobId, applicants }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data;
    },
    onSuccess(data) {
      if (data && data.success) {
        redirect(`/job/${id}/result`);
      }
    },
  });

  return (
    <Button
      className="my-2 cursor-pointer disabled:cursor-not-allowed"
      variant="outline"
      disabled={!!disabled || isPending}
      onClick={async () => {
        await mutateAsync(id);
      }}
    >
      {isPending ? "Chrunching data..." : "Rank with TalentScope"}
    </Button>
  );
}
