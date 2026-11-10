def get_paginated_results(query, page, per_page):
    """
    Get paginated results from a query
    :param query: SQLAlchemy query object
    :param page: Page number
    :param per_page: Items per page
    :return: Dictionary with paginated results and metadata
    """
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
        'next_num': pagination.next_num,
        'prev_num': pagination.prev_num
    }

def get_query_with_filters(query, model, filters):
    """
    Apply filters to a query
    :param query: SQLAlchemy query object
    :param model: SQLAlchemy model class
    :param filters: Dictionary of filters
    :return: Filtered query
    """
    for key, value in filters.items():
        if hasattr(model, key):
            query = query.filter(getattr(model, key) == value)
    return query

def get_query_with_search(query, model, search_fields, search_term):
    """
    Apply search to a query
    :param query: SQLAlchemy query object
    :param model: SQLAlchemy model class
    :param search_fields: List of fields to search
    :param search_term: Search term
    :return: Searched query
    """
    if not search_term:
        return query
    
    from sqlalchemy import or_
    search_clauses = []
    
    for field in search_fields:
        if hasattr(model, field):
            search_clauses.append(getattr(model, field).ilike(f'%{search_term}%'))
    
    if search_clauses:
        query = query.filter(or_(*search_clauses))
    
    return query
