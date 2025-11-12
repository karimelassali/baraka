import RegistrationForm from "@/components/forms/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 ">
        <div className=" py-8 px-4  shadow sm:rounded-lg sm:px-10">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
