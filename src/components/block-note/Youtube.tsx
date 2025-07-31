import {
  BlockNoteEditor,
  createBlockSpec,
  createResizableFileBlockWrapper,
  defaultProps,
  insertOrUpdateBlock,
  type BlockFromConfig,
  type FileBlockConfig,
  type Props,
  type PropSchema,
} from "@blocknote/core";
import { schema } from "../blocknotesidebar";

const YOUTUBE_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15.5L16 12L10 8.5V15.5ZM21.8 8.001C21.76 7.844 21.686 7.696 21.58 7.568C21.473 7.44 21.337 7.337 21.183 7.268C20.25 6.85 12 6.85 12 6.85C12 6.85 3.75 6.85 2.817 7.268C2.663 7.337 2.527 7.44 2.42 7.568C2.314 7.696 2.24 7.844 2.2 8.001C1.95 9.25 1.95 12 1.95 12C1.95 12 1.95 14.75 2.2 15.999C2.24 16.156 2.314 16.304 2.42 16.432C2.527 16.56 2.663 16.663 2.817 16.732C3.75 17.15 12 17.15 12 17.15C12 17.15 20.25 17.15 21.183 16.732C21.337 16.663 21.473 16.56 21.58 16.432C21.686 16.304 21.76 16.156 21.8 15.999C22.05 14.75 22.05 12 22.05 12C22.05 12 22.05 9.25 21.8 8.001Z"/></svg>';

export const youtubePropSchema = {
  textAlignment: defaultProps.textAlignment,
  backgroundColor: defaultProps.backgroundColor,

  name: { default: "" as const },
  showPreview: { default: true as const },

  url: { default: "" as const }, // will store embed URL
  caption: { default: "" as const },

  previewWidth: { default: undefined, type: "number" }, // default width
} satisfies PropSchema;

export const youtubeBlockConfig = {
  type: "youtube" as const,
  propSchema: youtubePropSchema,
  content: "none",
  isFileBlock: true,
  fileBlockAccept: [], // no file upload, just link
} satisfies FileBlockConfig;

export const youtubeRender = (
  block: BlockFromConfig<typeof youtubeBlockConfig, any, any>,
  editor: BlockNoteEditor<any, any, any>
) => {
  const icon = document.createElement("div");
  icon.innerHTML = YOUTUBE_ICON_SVG;

  const wrapper = document.createElement("div");
  wrapper.className = "bn-visual-media-wrapper";

  const iframe = document.createElement("iframe");
  iframe.className = "bn-visual-media";
  iframe.width = block.props.previewWidth.toString();
  iframe.height = "315";
  iframe.src = block.props.url;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.frameBorder = "0";
  iframe.contentEditable = "false";

  wrapper.appendChild(iframe);

  return createResizableFileBlockWrapper(
    block,
    editor,
    { dom: wrapper },
    wrapper,
    "Embed YouTube",
    icon.firstElementChild as HTMLElement
  );
};

export const parseYouTubeElement = (
  el: HTMLElement
): Partial<Props<typeof youtubePropSchema>> | undefined => {
  let url = "";

  if (el.tagName === "IFRAME" || el.tagName === "A") {
    url = (el as HTMLIFrameElement).src || (el as HTMLAnchorElement).href || "";
  }
  if (!url) return;

  // Extract video ID from URL
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = match?.[1];
  if (!videoId) return;

  return {
    url: `https://www.youtube.com/embed/${videoId}`,
    previewWidth: 560,
  };
};

export const YouTubeBlock = createBlockSpec(youtubeBlockConfig, {
  render: youtubeRender,
  parse: parseYouTubeElement,
});

export const insertYouTube = (editor: typeof schema.BlockNoteEditor) => ({
  title: "YouTube",
  subtext: "Embed a YouTube video",
  content: "block", // usually for blocks
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "youtube",
      props: {
        url: "",
        caption: "",
        previewWidth: 560,
        name: "",
        showPreview: true,
        textAlignment: "left",
        backgroundColor: "default",
      },
    }),
  aliases: ["youtube", "yt", "يوتيوب"],
  group: "blockContent",
  badge: "Ctrl + Alt + y",
});
