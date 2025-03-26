import { ModelsResponse } from "@/types/api/modelTypes";

interface ModelListProps {
  data: ModelsResponse;
}

const ModelList: React.FC<ModelListProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {data.models.map((model) => (
        <div key={model.id} className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">{model.name}</h2>
          <p className="text-sm">
            Created: {new Date(model.createdAt).toLocaleDateString()}
          </p>
          <a href={model.fileUrl} download className="text-blue-500 underline">
            Download Model
          </a>
        </div>
      ))}
    </div>
  );
};

export default ModelList;
