import BreadCrumb from '@/components/BreadCrumb';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import UsersStatistics from './components/UsersStatistics';
import UsersTable from './components/UsersTable';

const UsersPage = (): JSX.Element => {
  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="Users" icon={faUserFriends} />
      <UsersStatistics />
      <div className="praise-box">
        <UsersTable />
      </div>
    </div>
  );
};

export default UsersPage;
