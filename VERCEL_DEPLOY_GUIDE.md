# Deploy Client to Vercel

1.  **Go to Vercel**: [vercel.com/new](https://vercel.com/new)
2.  **Import Repository**: Select `kds-client` from your GitHub.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js (Auto-detected)
    *   **Root Directory**: `.` (Default)
    *   **Build Command**: `npm run build` (Default)
4.  **Environment Variables**:
    You MUST add this variable so the client can talk to your backend:

    | Variable | Value |
    | :--- | :--- |
    | `NEXT_PUBLIC_API_URL` | `https://your-service-name.onrender.com` |

    *(Replace the value with your actual Render Backend URL)*

5.  **Deploy**: Click **Deploy**.
