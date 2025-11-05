// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// const MessageRequests: React.FC = () => {
//   const [requests, setRequests] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const res = await fetch("/api/messageRequests/get");
//         const data = await res.json();
//         if (res.ok) setRequests(data.requests || []);
//         else console.error(data.error);
//       } catch (err) {
//         console.error("Failed to fetch message requests:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRequests();
//   }, []);

//   const handleAction = async (request_id: string, status: "accepted" | "rejected" | "blocked") => {
//     try {
//       setProcessing(request_id);
//       const res = await fetch("/api/messageRequests/status", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ request_id, status }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to update request");
//       toast.success(`Request ${status}!`);
//       setRequests((prev) => prev.filter((r) => r.id !== request_id));
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setProcessing(null);
//     }
//   };

//   if (loading)
//     return (
//       <p className="text-sm text-text-secondary text-center py-4">
//         Loading message requests...
//       </p>
//     );

//   if (requests.length === 0)
//     return (
//       <p className="text-sm text-text-secondary text-center py-4">
//         You have no message requests.
//       </p>
//     );

//   return (
//     <div className="space-y-4">
//       {requests.map((req) => (
//         <div
//           key={req.id}
//           className="flex justify-between items-center bg-bg-dark border border-border-secondary p-3 rounded-lg"
//         >
//           <div>
//             <p className="text-text-primary text-sm font-semibold">
//               {req.sender?.full_name || req.sender?.username || "Unknown User"}
//             </p>
//             <p className="text-xs text-text-secondary">
//               Sent {new Date(req.created_at).toLocaleDateString()}
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => handleAction(req.id, "accepted")}
//               disabled={processing === req.id}
//               className="px-3 py-1 text-xs rounded bg-btn-primary text-white hover:bg-btn-primary-hover transition disabled:opacity-60"
//             >
//               Accept
//             </button>
//             <button
//               onClick={() => handleAction(req.id, "rejected")}
//               disabled={processing === req.id}
//               className="px-3 py-1 text-xs rounded border border-border-secondary text-text-primary hover:bg-bg-dark-gray transition disabled:opacity-60"
//             >
//               Reject
//             </button>
//             <button
//               onClick={() => handleAction(req.id, "blocked")}
//               disabled={processing === req.id}
//               className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
//             >
//               Block
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MessageRequests;