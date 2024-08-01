import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const imgRef = useRef(null);

  const queryClient = useQueryClient();

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const formData = new FormData();
        formData.append("text", text);
        if (img) {
          formData.append("img", img);
        }
        const response = await fetch("/api/v1/posts", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          setText("");
          setImg(null);
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          return data;
        } else {
          toast.error(data.message);
        }
        return data;
      } catch (error) {
        toast.error("Something went wrong. Please try again later.");
      }
    },
  });

  const data = {
    profileImg: "/avatars/boy1.png",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img
            src={data.profileImg || "/avatar-placeholder.png"}
            alt="Profile"
          />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={URL.createObjectURL(img)}
              className="w-full mx-auto h-72 object-contain rounded"
              alt="Selected"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={(e) => setImg(e.target.files[0])}
          />
          <button
            className="btn btn-primary rounded-full btn-sm text-white px-4"
            disabled={isPending}
          >
            {isPending ? "Please Wait..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
