import React, { useState, useEffect } from "react";
import axios from "axios";
import "./KanbanBoard.css"; // Assuming you will be adding custom styles here

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState(() => localStorage.getItem('groupBy') || "status"); // Load from localStorage
  const [orderBy, setOrderBy] = useState(() => localStorage.getItem('orderBy') || "priority"); // Load from localStorage
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("https://api.quicksell.co/v1/internal/frontend-assignment");
        setTickets(response.data.tickets);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching tickets: ", error);
      }
    }
    fetchData();
  }, []);

  // Function to group tickets based on selected option
  const groupTickets = () => {
    let groupedTickets = {};
    if (groupBy === "status") {
      groupedTickets = tickets.reduce((acc, ticket) => {
        if (!acc[ticket.status]) {
          acc[ticket.status] = [];
        }
          acc[ticket.status].push(ticket);
          acc["done"] = [];
          acc["cancelled"] = [];
        return acc;
      }, {});
    } else if (groupBy === "user") {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const user = users.find((user) => user.id === ticket.userId);
        const userName = user ? user.name : "Unknown";
        if (!acc[userName]) {
          acc[userName] = [];
        }
        acc[userName].push(ticket);
        return acc;
      }, {});
    } else if (groupBy === "priority") {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const priority = ticket.priority;
        if (!acc[priority]) {
          acc[priority] = [];
        }
        acc[priority].push(ticket);
        return acc;
      }, {});
    }
    return groupedTickets;
  };

  // Sorting logic based on the ordering preference
  const sortTickets = (groupedTickets) => {
    Object.keys(groupedTickets).forEach((group) => {
      groupedTickets[group].sort((a, b) => {
        if (orderBy === "priority") {
          return b.priority - a.priority; // Sort by priority descending
        } else if (orderBy === "title") {
          return a.title.localeCompare(b.title); // Sort by title ascending
        }
        return 0;
      });
    });
    return groupedTickets;
  };

  // Get grouped and sorted tickets
  const groupedTickets = sortTickets(groupTickets());

  // Save state to localStorage when groupBy or orderBy changes
  useEffect(() => {
    localStorage.setItem('groupBy', groupBy);
    localStorage.setItem('orderBy', orderBy);
  }, [groupBy, orderBy]);

  return (
    <div className="kanban-board">
      <div className="controls">
        <button 
          className="dropdown-toggle" 
          onClick={() => setShowDisplayOptions(!showDisplayOptions)}
        >
          <img 
            src="/icons1/Display.svg" 
            alt="Display Options" 
            style={{ width: '10px', height: '10px', marginRight: '8px' }} 
          />
          Display
          <img 
            src="/icons1/down.svg" 
            alt="Display Options" 
            style={{ width: '10px', height: '10px', marginLeft: '8px' }} 
          />
        </button>

        <h2 style={{ marginLeft: '20px', display: 'inline-block' }}>
          SAHIL AGARWAL 21BBS0169
        </h2>

        {showDisplayOptions && (
          <div className="dropdown-menu">
            <div className="dropdown">
              <label>Grouping:</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            <div className="dropdown">
              <label>Ordering:</label>
              <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="kanban-columns">
        {Object.keys(groupedTickets).map((group) => (
          <div key={group} className="kanban-column">
            <h5>
              <img
                src={
                  groupBy === "user"
                    ? `/icons1/user.jpg` // Different image path for users
                    : `/icons1/${group}.svg`
                }
                alt={`${group}`}
                style={{ width: "13px", height: "13px", marginRight: "5px" }}
              />
              {groupBy === "priority"
                ? // Mapping priority numbers to their respective labels
                  (group === "4" ? "Urgent" :
                  group === "3" ? "High" :
                  group === "2" ? "Medium" :
                  group === "1" ? "Low" : "No priority")
                : group}
              <img 
                src="/icons1/add.svg" 
                alt="Add Icon" 
                style={{ width: '16px', height: '16px', marginLeft: '45%' }} 
              />
              <img 
                src="/icons1/dotmenu.svg" 
                alt="Dot Menu Icon" 
                style={{ width: '16px', height: '16px', marginLeft: '2px' }} 
              />
            </h5>

            <div className="kanban-cards">
              {groupedTickets[group].length > 0 ? (
                groupedTickets[group].map((ticket) => (
                  <div key={ticket.id} className="kanban-card">
                    {/* Card Header */}
                    <div className="card-header">
                      <span>{ticket.id}</span>
                      {groupBy !== 'user' && (
                        <img
                          src={users.find((user) => user.id === ticket.userId)?.avatar || "/icons1/user.jpg"}
                          alt="User Avatar"
                          className="user-avatar"
                        />
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="card-title-section">
                      {groupBy !== "status" && (
                        <img
                          src={`/icons1/${ticket.status}.svg`}
                          alt="Status Icon"
                          className="status-icon"
                        />
                      )}
                      <h4 className="ticket-title">{ticket.title}</h4>
                    </div>

                    {/* Card Footer */}
                    <div className="card-footer">
                      {groupBy !== "priority" && (
                        <img
                          src={`/icons1/${ticket.priority}.svg`}
                          alt="Priority Icon"
                          className="priority-icon"
                        />
                      )}
                      <div className="tag-container">
                        <span className="gray-dot"></span>
                        <span className="feature-tag">{ticket.tag.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message" style={{ padding: '10px',color: 'gray' }}>
                  No data available for this {groupBy}.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
