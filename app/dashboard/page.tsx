"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import supabase from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import { ProductChat } from "@/components/product-chat/product-chat";

const formSchema = z.object({
  loan_type: z.string().min(1, { message: "Please select a loan type." }),
  max_apr: z.coerce
    .number()
    .min(0, { message: "APR must be positive." })
    .max(100, { message: "APR cannot exceed 100%." }),
  monthly_income: z.coerce
    .number()
    .min(0, { message: "Income must be positive." }),
  credit_score: z.coerce
    .number()
    .min(300, { message: "Credit score must be at least 300." })
    .max(900, { message: "Credit score cannot exceed 900." }),
});

const RecomendationPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      loan_type: "",
      max_apr: 15,
      monthly_income: 0,
      credit_score: 700,
    },
  });

  useEffect(() => {
    // Initial load - no products until form is submitted
    setLoading(false);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("type", values.loan_type)
        .lte("rate_apr", values.max_apr)
        .lte("min_income", values.monthly_income)
        .lte("min_credit_score", values.credit_score)
        .order("rate_apr", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Fetched filtered products:", data);
        setFilteredProducts(data);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  }

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Your Profile</DialogTitle>
            <DialogDescription>
              Fill in the details to get personalized recommendations.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="loan_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="credit_line">Credit Line</SelectItem>
                        <SelectItem value="debt_consolidation ">
                          Debt Consolidation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_apr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Max APR (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gray-200"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Find Recommendations
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Find Your Perfect Loan
          </h1>
          <p className="text-muted-foreground mt-2">
            Tell us about your requirements and profile, and we'll recommend the
            best products for you.
          </p>
        </div>
        {!isDialogOpen && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gray-200 hover:bg-gray-300 hover:text-gray-800 hover:cursor-pointer"
          >
            Update Preferences
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {filteredProducts === null ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center border rounded-lg bg-gray-50/50 border-dashed">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No recommendations yet</h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              Fill out the form to see the best loan products tailored to your
              needs.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gray-200 hover:bg-gray-300 hover:text-gray-800 hover:cursor-pointer"
            >
              Get Started
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center border rounded-lg bg-gray-50/50 border-dashed">
            <h3 className="text-lg font-medium">No matching products found</h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              Try adjusting your filters, like increasing the Max APR or
              checking your eligibility details.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gray-200 hover:bg-gray-300 hover:text-gray-800 hover:cursor-pointer"
            >
              Adjust Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="mt-1 font-medium text-primary">
                        {product.bank}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {product.type?.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold text-lg">
                        {formatPercent(product.rate_apr)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Processing Fee</p>
                      <p className="font-medium">
                        {product.processing_fee_pct
                          ? formatPercent(product.processing_fee_pct)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Income</p>
                      <p className="font-medium">
                        {formatCurrency(product.min_income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Credit Score</p>
                      <p className="font-medium">{product.min_credit_score}+</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {product.disbursal_speed && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-200"
                        >
                          {product.disbursal_speed} Disbursal
                        </Badge>
                      )}
                      {product.prepayment_allowed && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          Prepayment Allowed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <ProductChat product={product} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecomendationPage;
