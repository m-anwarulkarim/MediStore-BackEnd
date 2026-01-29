// export function generateOrderNumber() {
//   // Example output : MS-1705859234123-4821
//   const timestamp = Date.now();
//   const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random

//   return `MS-${timestamp}-${random}`;
// }

export const generateOrderNumber = () => {
  // Example: ORD20260129-1234
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `ORD${ymd}-${random}`;
};
