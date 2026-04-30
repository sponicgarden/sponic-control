"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MeetingsIndexPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || "en";

  useEffect(() => {
    router.replace(`/${lang}/intranet/meetings/list`);
  }, [router, lang]);

  return null;
}
