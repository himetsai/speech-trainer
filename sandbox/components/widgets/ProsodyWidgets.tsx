import { AudioWidgets } from "./AudioWidgets";

type AudioWidgetsProps = {
  recording: boolean;
}

export function ProsodyWidgets({ recording }: AudioWidgetsProps) {
  return (
    <div>
      <AudioWidgets
        modelName="prosody"
        recording={recording}
        recordingLengthMs={500}
        streamWindowLengthMs={5000}
      />
    </div>
  );
}
