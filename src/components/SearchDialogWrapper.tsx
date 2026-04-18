"use client";

import SearchDialog from "@/components/SearchDialog";
import { useSearchOpen } from "@/components/SearchContext";

export default function SearchDialogWrapper() {
  const { open, closeSearch } = useSearchOpen();

  return <SearchDialog open={open} onClose={closeSearch} />;
}
