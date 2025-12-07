## 🚀 Features

- **Personalized Recommendations**: Input your financial details (Income, Credit Score, Preferred APR) to get tailored loan product suggestions.
- **AI Product Assistant**: Chat with a Gemini-powered AI assistant for every specific product to ask about eligibility, interest rates, and terms.
- **Secure Authentication**: Robust sign-up and sign-in flow powered by Supabase Auth with redirection logic for invalid credentials.
- **Interactive Dashboard**: A clean, responsive dashboard to browse all available loan products.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) (`gemini-1.5-flash`)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏗️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Shobhitsingh-2503/clickpe-assignment.git
    cd clickpe-assignment
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**

    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_google_gemini_api_key
    ```

4.  **Database Setup:**

    Run the following SQL in your Supabase SQL Editor to set up the necessary tables:

    ```sql
    -- Products Table
    create table public.products (
      id uuid not null default gen_random_uuid (),
      name text not null,
      bank text not null,
      type text not null,
      rate_apr numeric not null,
      min_income numeric not null,
      min_credit_score numeric not null,
      processing_fee_pct numeric null,
      prepayment_allowed boolean null default false,
      disbursal_speed text null,
      created_at timestamp with time zone null default now(),
      constraint products_pkey primary key (id)
    );

    -- AI Chat Messages Table
    create table public.ai_chat_messages (
      id uuid not null,
      user_id uuid null,
      product_id uuid null,
      role text null,
      content text not null,
      created_at timestamp with time zone null default now(),
      constraint ai_chat_messages_pkey primary key (id),
      constraint ai_chat_messages_product_id_fkey foreign KEY (product_id) references products (id),
      constraint ai_chat_messages_user_id_fkey foreign KEY (user_id) references users (id),
      constraint ai_chat_messages_role_check check (
        (role = any (array['user'::text, 'assistant'::text]))
      )
    );
    ```

5.  **Run Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── app/
│   ├── (auth)/          # Authentication routes (Sign In, Sign Up)
│   ├── api/chat/        # Next.js API route for Gemini integration
│   ├── dashboard/       # Main application dashboard
│   │   ├── about/       # Resume page
│   │   ├── all/         # All products view
│   │   ├── contact/     # Contact page
│   │   └── page.tsx     # Recommendation engine page
│   └── page.tsx         # Landing / Redirection logic
├── components/
│   ├── auth/            # Auth providers and wrappers
│   ├── dashboard/       # Dashboard specific components
│   ├── product-chat/    # AI Chat component
│   └── ui/              # Reusable UI components (Shadcn)
├── lib/
│   ├── supabaseClient.ts # Supabase client initialization
│   └── types.ts          # TS interfaces
└── public/              # Static assets
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
