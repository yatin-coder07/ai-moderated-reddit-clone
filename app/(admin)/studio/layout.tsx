import type { Metadata } from "next";





export const metadata: Metadata = {
  title: "Reddish",
  description: "ReddishQAZ#X X",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
     <html lang="en">
      <body>
      
         {children}
          
          
        
        
      </body>
    </html>
   
  );
}
