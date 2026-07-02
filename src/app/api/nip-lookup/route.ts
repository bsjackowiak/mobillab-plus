import { fetchCompanyByNip } from "@/lib/nip-lookup";
import { isValidNip, normalizeNip } from "@/lib/invoice";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const nip = normalizeNip(new URL(request.url).searchParams.get("nip") ?? "");

  if (!isValidNip(nip)) {
    return NextResponse.json({ message: "Nieprawidłowy NIP" }, { status: 400 });
  }

  try {
    const company = await fetchCompanyByNip(nip, {
      regonApiKey: process.env.GUS_REGON_API_KEY,
      ceidgToken: process.env.CEIDG_API_TOKEN,
    });

    if (!company) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Nie znaleziono firmy po NIP",
          hint:
            "Sprawdź numer lub uzupełnij dane ręcznie. Dla JDG skonfiguruj GUS_REGON_API_KEY lub CEIDG_API_TOKEN.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(company);
  } catch {
    return NextResponse.json(
      { code: "UPSTREAM_ERROR", message: "Nie udało się pobrać danych firmy" },
      { status: 502 },
    );
  }
}
