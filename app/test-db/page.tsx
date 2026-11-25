
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDatabase() {
  const [message, setMessage] = useState("Checking database...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) {
        setMessage("Connection error: " + error.message);
      } else {
        setMessage("SUCCESS! Supabase is connected. Categories found: " + data.length);
      }
    }

    testConnection();
  }, []);

  return (
    <main className="p-10 text-xl">
      {message}
    </main>
  );
}
