from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.task import Task
from app.models.user import User
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    project: str = ""
    assignee: str = ""
    priority: str = "medium"
    status: str = "todo"
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    estimated_hours: float = 0
    actual_hours: float = 0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project: Optional[str] = None
    assignee: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None


def task_to_dict(task: Task) -> dict:
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "project": task.project,
        "assignee": task.assignee,
        "priority": task.priority,
        "status": task.status,
        "start_date": str(task.start_date) if task.start_date else None,
        "due_date": str(task.due_date) if task.due_date else None,
        "estimated_hours": task.estimated_hours,
        "actual_hours": task.actual_hours,
        "created_at": str(task.created_at),
    }


@router.get("")
def list_tasks(
    status: str = "",
    priority: str = "",
    project: str = "",
    assignee: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Task)
    if status:
        q = q.filter(Task.status == status)
    if priority:
        q = q.filter(Task.priority == priority)
    if project:
        q = q.filter(Task.project == project)
    if assignee:
        q = q.filter(Task.assignee == assignee)
    results = q.order_by(Task.created_at.desc()).all()
    return [task_to_dict(t) for t in results]


@router.post("")
def create_task(task_data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        project=task_data.project,
        assignee=task_data.assignee,
        priority=task_data.priority,
        status=task_data.status,
        start_date=task_data.start_date,
        due_date=task_data.due_date,
        estimated_hours=task_data.estimated_hours,
        actual_hours=task_data.actual_hours,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task_to_dict(task)


@router.get("/stats")
def get_task_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Task).count()
    todo = db.query(Task).filter(Task.status == "todo").count()
    in_progress = db.query(Task).filter(Task.status == "in_progress").count()
    done = db.query(Task).filter(Task.status == "done").count()
    high_priority = db.query(Task).filter(
        Task.priority == "high", Task.status != "done"
    ).count()
    return {
        "total": total,
        "todo": todo,
        "in_progress": in_progress,
        "done": done,
        "high_priority": high_priority,
    }


@router.put("/{task_id}")
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = task_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task_to_dict(task)


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True, "message": "Task deleted"}


@router.post("/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "done"
    db.commit()
    db.refresh(task)
    return task_to_dict(task)
