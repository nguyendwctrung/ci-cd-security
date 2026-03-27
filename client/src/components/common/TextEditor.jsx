
import { Editor } from "@tinymce/tinymce-react";


export default function TinyMCEEditor({
  value,
  onEditChange,
  isReadOnly = false,
}) {

  return (
    <>  
      <Editor
        apiKey={`${import.meta.env.VITE_TINY_MCE}`}
        onEditorChange={onEditChange}
        initialValue={value}
        disabled={isReadOnly}   
        init={{
          height: 300,
          menubar: !isReadOnly,
          directionality: "ltr",
          skin: "oxide-dark",
          theme : "silver",
          content_css: "dark",
          toolbar: `undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help`,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
            "directionality"
          ],
        }}
      />
    </>
  );
}
