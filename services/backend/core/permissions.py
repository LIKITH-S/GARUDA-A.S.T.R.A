from fastapi import HTTPException, status

def require_role(user, allowed_roles: list[str]):
    """
    Validates if the user's role is within the allowed_roles list.
    """
    user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
    if user_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation not permitted for role: {user_role}",
        )
