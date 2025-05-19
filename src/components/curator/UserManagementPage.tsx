// components/curator/UserManagementPage.tsx
"use client";

import React, { useState } from "react";
import UserCreationForm from "@/components/curator/UserCreationForm";
import UserManagement from "@/components/curator/UserManagement";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

export function UserManagementPage() {
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  // Обработчик успешного создания пользователя
  const handleUserCreated = () => {
    // Увеличиваем счетчик для триггера обновления списка пользователей
    setRefreshUsers((prev) => prev + 1);

    // Переключаемся на вкладку со списком пользователей
    setTabIndex(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>

      <TabGroup selectedIndex={tabIndex} onChange={setTabIndex}>
        <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-700 hover:bg-white/[0.12] hover:text-blue-900"
              }`
            }
          >
            Создание пользователей
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-700 hover:bg-white/[0.12] hover:text-blue-900"
              }`
            }
          >
            Список пользователей
          </Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка создания пользователей */}
          <TabPanel>
            <div className="space-y-6 max-w-3xl mx-auto">
              <UserCreationForm onUserCreated={handleUserCreated} />
            </div>
          </TabPanel>

          {/* Вкладка списка пользователей */}
          <TabPanel>
            <div className="space-y-6">
              <UserManagement key={refreshUsers} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default UserManagementPage;
