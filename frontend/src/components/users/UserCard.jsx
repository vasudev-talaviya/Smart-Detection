import { Trash2, Edit2, Shield } from "lucide-react";
import { Button } from "../common";

export default function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="card bg-base-200/50 backdrop-blur-md shadow-lg border border-base-content/5 hover-lift glow-border group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="card-body p-4 items-center text-center relative z-10">
        <div className="avatar placeholder mb-2">
          <div className="bg-neutral text-neutral-content rounded-full w-16 ring ring-primary ring-offset-base-100 ring-offset-2">
            <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <h3 className="font-bold truncate w-full">{user.name}</h3>
        <div className="badge badge-outline badge-sm gap-1 my-1">
          <Shield className="w-3 h-3" />
          {user.template_count} template{user.template_count !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle shadow-md"
            onClick={() => onEdit(user)}
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle shadow-md"
            onClick={() => onDelete(user.id, user.name)}
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
