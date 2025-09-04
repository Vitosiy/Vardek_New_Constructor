<template>
  <div class="p-4">
    <!-- <input type="file" @change="onFileChange" />
    <button
      @click="uploadFile"
      class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Загрузить
    </button> -->

    <button
      @click="uploadFile"
      class="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded"
    >
      Сделать скриншот
    </button>

    <!-- <p v-if="response">Ответ сервера: {{ response }}</p> -->
    <img v-if="response" :src="response" class="mt-4 border rounded" />

    <!-- <div v-if="previewUrl" class="mt-4">
      <h3>Предварительный просмотр:</h3>
      <img :src="previewUrl" class="border rounded max-w-full h-auto" alt="Preview" />
    </div> -->
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps(["verdekConstructor"]);

const selectedFile = ref(null);
const response = ref("");
const previewUrl = ref("");
const _API_KEY = "450ca8c7-12fb-492c-ac55-d54862edbdb2";
const prompt = ref(
  "highly detailed screenshot of a software settings window, clean modern UI, sharp text, realistic shadows, professional lighting, 4k resolution, ultra-realistic, photorealistic"
);

function onFileChange(event) {
  selectedFile.value = event.target.files[0];
}

const takeScreenshot = async () => {
  const dataURL =
    props.verdekConstructor.renderer.instance.domElement.toDataURL("image/png");
  const domelement = props.verdekConstructor.renderer.instance.domElement;

  const blob = await (await fetch(dataURL)).blob();
  selectedFile.value = new File([blob], "screenshot.png", {
    type: "image/png",
  });
  console.log(domelement.clientWidth, domelement.clientHeight, "renderer");
  previewUrl.value = dataURL;
};

async function uploadFile() {
  await takeScreenshot();

  if (!selectedFile.value) {
    alert("Сначала выбери файл!");
    return;
  }

  const formData = new FormData();
  formData.append("initial_image_file", selectedFile.value);
  formData.append("control_image_file", selectedFile.value);
  // formData.append(
  //   "prompt",
  //   "RAW photo of modern interior scene, detailed furniture, realistic textures and materials, soft diffused natural lighting, volumetric god rays, photorealistic, 8k uhd, dslr, high detail, film grain, natural depth of field, realistic shadows and reflections, professional photography, Fujifilm XT3"
  // );
  // formData.append(
  //   "negative_prompt",
  //   "worst quality, low quality, blurry, deformed, artifacts, cartoon, anime, 3d render, text, cropped, overexposed, underexposed, flat lighting, no shadows, low detail, unnatural colors"
  // );
  // formData.append("strength", "0.25");
  // formData.append("guidance", "3.5");
  // formData.append("steps", "40");
  // formData.append("seed", "31337");

  try {
    const res = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    response.value = url;
  } catch (error) {
    alert(`Ошибка при загрузке: ${error.message}`);
  }

  // const formData = new FormData();
  // formData.append("file", selectedFile.value);
  // formData.append(
  //   "prompt",
  //   "ultra realistic photo, 4k, natural lighting, detailed textures"
  // );
  // formData.append("strength", "0.75");
  // formData.append("guidance", "7.5");

  // const res = await fetch("http://127.0.0.1:8000/generate", {
  //   method: "POST",
  //   body: formData,
  // });

  // const blob = await res.blob();
  // const url = URL.createObjectURL(blob);
  // response.value = url;
}

const getStabilityImage = async () => {
  await takeScreenshot();

  if (!selectedFile.value) {
    alert("Please select a file first!");
    return;
  }

  const domelement = props.verdekConstructor.renderer.instance.domElement;

  const formData = new FormData();
  formData.append("image", selectedFile.value); // Ensure selectedFile.value is a File or Blob
  formData.append("text", prompt.value || ""); // Fallback to empty string if prompt is undefined
  formData.append(
    "resolution",
    `${domelement.clientWidth}x${domelement.clientHeight}`
  );
  // formData.append("output_format", "png");
  // formData.append("strength", "0.5");

  try {
    const res = await fetch(
      `https://api.deepai.org/api/image-editor`, // Correct endpoint for upscaling
      {
        method: "POST",
        headers: {
          "api-key": "9628e71e-4720-403f-98a5-f974c284a9be", // Ваш API-ключ DeepAI (без Bearer)
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text(); // Get error details from response
      throw new Error(
        `HTTP error! status: ${res.status}, message: ${errorText}`
      );
    }

    // const blob = await res.blob();
    // const url = URL.createObjectURL(blob);
    // response.value = url; // Store the image URL
    const data = await res.json(); // Парсим JSON-ответ
    // response.value = data.output_url; // Сохраняем URL сгенерированного изображения
  } catch (error) {
    console.error("Error uploading to Stability AI:", error);
    alert(`Error during upload: ${error.message}`);
  }
};
</script>
