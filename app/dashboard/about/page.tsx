import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ResumePage = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 w-full min-h-[600px] shadow-md border-muted/60">
        <CardHeader>
          <div>Resume Preview</div>
        </CardHeader>
        <CardContent className="h-full p-0 min-h-[600px] overflow-hidden rounded-b-xl relative">
          <iframe
            src="https://drive.google.com/file/d/1Bkqz-0io08qO67C_JIlaq7IUOzaZwp6m/preview"
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay"
            loading="lazy"
            title="Resume"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumePage;
