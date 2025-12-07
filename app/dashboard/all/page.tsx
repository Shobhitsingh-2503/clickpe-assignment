"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import supabase from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import { Filter, RefreshCcw, Search, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const AllProductPage = () => {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [aprRange, setAprRange] = useState<[number, number]>([0, 30]);
  const [minIncome, setMinIncome] = useState<string>("");
  const [minCreditScore, setMinCreditScore] = useState<string>("");

  // Debounced Values
  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedApr = useDebounce(aprRange, 500);
  const debouncedIncome = useDebounce(minIncome, 500);
  const debouncedCreditScore = useDebounce(minCreditScore, 500);

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("products").select("*");

      // Server-side Filtering

      // Search Query (Bank or Name)
      if (debouncedSearch) {
        query = query.or(
          `bank.ilike.%${debouncedSearch}%,name.ilike.%${debouncedSearch}%`
        );
      }

      // APR Range (assuming rate_apr is in basis points or similar scale as original code: * 100)
      if (debouncedApr) {
        query = query
          .gte("rate_apr", debouncedApr[0] * 100)
          .lte("rate_apr", debouncedApr[1] * 100);
      }

      // Min Income
      if (debouncedIncome) {
        query = query.lte("min_income", parseInt(debouncedIncome));
      }

      // Min Credit Score
      if (debouncedCreditScore) {
        query = query.lte("min_credit_score", parseInt(debouncedCreditScore));
      }

      const { data, error } = await query;

      if (error) {
        console.log(error);
      }

      if (data) {
        setData(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedApr, debouncedIncome, debouncedCreditScore]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setAprRange([0, 30]);
    setMinIncome("");
    setMinCreditScore("");
  };

  // Shared Filter Inputs
  const AprFilter = () => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>APR Range</Label>
        <span className="text-xs text-muted-foreground">
          {aprRange[0]}% - {aprRange[1]}%
        </span>
      </div>
      <Slider
        defaultValue={[0, 30]}
        max={50}
        step={0.5}
        value={aprRange}
        onValueChange={(val) => setAprRange(val as [number, number])}
        className="bg-gray-400 rounded"
      />
    </div>
  );

  const IncomeFilter = () => (
    <div className="space-y-2">
      <Label>My Monthly Income</Label>
      <Input
        type="number"
        placeholder="e.g. 25000"
        className="bg-white"
        value={minIncome}
        onChange={(e) => setMinIncome(e.target.value)}
      />
    </div>
  );

  const CreditScoreFilter = () => (
    <div className="space-y-2">
      <Label>My Credit Score</Label>
      <Input
        type="number"
        placeholder="e.g. 750"
        className="bg-white"
        value={minCreditScore}
        onChange={(e) => setMinCreditScore(e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
        <p className="text-muted-foreground">
          View and compare all available loan products.
        </p>
      </div>

      {/* Mobile View Filters */}
      <div className="flex md:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bank..."
            className="pl-8 bg-white w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Refine your search results.
                </p>
              </div>
              <div className="grid gap-4">
                <AprFilter />
                <IncomeFilter />
                <CreditScoreFilter />
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => getProducts()}
          size="icon"
          className="bg-gray-100 shrink-0"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
        {/* Bank Search */}
        <div className="space-y-2">
          <Label>Bank Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bank..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <AprFilter />
        <IncomeFilter />
        <CreditScoreFilter />

        <Button onClick={() => getProducts()} className="bg-gray-100 w-fit">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Active Filters & Results */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {data?.length || 0}
          </span>{" "}
          results
        </div>

        {(searchQuery ||
          aprRange[0] !== 0 ||
          aprRange[1] !== 30 ||
          minIncome ||
          minCreditScore) && (
          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <Badge
                variant="secondary"
                className="bg-gray-100 px-2 py-1 border hover:cursor-pointer"
                onClick={() => setSearchQuery("")}
              >
                Search: {searchQuery}
              </Badge>
            )}
            {(aprRange[0] !== 0 || aprRange[1] !== 30) && (
              <Badge
                variant="secondary"
                className="bg-gray-100 px-2 py-1 border hover:cursor-pointer"
                onClick={() => setAprRange([0, 30])}
              >
                APR: {aprRange[0]}% - {aprRange[1]}%
              </Badge>
            )}
            {minIncome && (
              <Badge
                variant="secondary"
                className="bg-gray-100 px-2 py-1 border hover:cursor-pointer"
                onClick={() => setMinIncome("")}
              >
                Income: {minIncome}
              </Badge>
            )}
            {minCreditScore && (
              <Badge
                variant="secondary"
                className="bg-gray-100 px-2 py-1 border hover:cursor-pointer"
                onClick={() => setMinCreditScore("")}
              >
                Credit Score: {minCreditScore}
              </Badge>
            )}
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="bg-gray-100 h-7 px-2 text-xs"
            >
              Clear All
              <X className="ml-2 h-3 w-3 text-red-500" />
            </Button>
          </div>
        )}
      </div>

      {/* Products */}
      <Card className="rounded-md border bg-white h-[calc(100vh-300px)] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 font-bold bg-white shadow-sm">
            <TableRow>
              <TableHead className="w-[250px]">Product Details</TableHead>
              <TableHead>Interest (APR)</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Tenure</TableHead>
              <TableHead>Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-[80px]" />
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-[140px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.bank}
                      </span>
                      <Badge
                        variant="secondary"
                        className="w-fit capitalize text-[10px]"
                      >
                        {product.type?.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPercent(product.rate_apr)}
                    </div>
                    {product.processing_fee_pct && (
                      <div className="text-xs text-muted-foreground">
                        Proc. Fee: {formatPercent(product.processing_fee_pct)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="whitespace-nowrap">
                        Min Income: {formatCurrency(product.min_income)}
                      </div>
                      <div className="whitespace-nowrap">
                        Credit Score: {product.min_credit_score}+
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {product.tenure_min_months} - {product.tenure_max_months}{" "}
                      months
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {product.disbursal_speed && (
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px]"
                        >
                          {product.disbursal_speed} Disbursal
                        </Badge>
                      )}
                      {product.prepayment_allowed && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-[10px]"
                        >
                          Prepayment Allowed
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AllProductPage;
