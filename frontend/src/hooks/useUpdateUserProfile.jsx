import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try {
          const response = await fetch("/api/v1/users/update", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.success) {
            toast.success(data.message);
            Promise.all([
              queryClient.invalidateQueries({ queryKey: ["authUser"] }),
              queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
            ]);
            return data.data;
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error("Something went wrong. Please try again later.");
        }
      },
    });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
