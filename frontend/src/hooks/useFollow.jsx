import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await fetch(`/api/v1/users/follow/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          Promise.all([
            queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
            queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          ]);
          return data;
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again later.");
      }
    },
  });

  return { follow, isPending };
};

export default useFollow;
