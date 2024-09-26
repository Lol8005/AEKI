const AdminManagement = artifacts.require("AdminManagement");
const { expectRevert, time } = require('@openzeppelin/test-helpers');

contract("AdminManagement", (accounts) => {
    let adminManagement;
    const superAdmin = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];

    before(async () => {
        adminManagement = await AdminManagement.new();
    });

    describe("Super Admin Functions", () => {
        it("should register a new admin", async () => {
            await adminManagement.registerNewAdmin(admin1, { from: superAdmin });
            const admin = await adminManagement.admins(admin1);
            assert.equal(admin.status.toString(), "1"); // Active
        });

        it("should not allow registering the super admin as an admin", async () => {
            await expectRevert(
                adminManagement.registerNewAdmin(superAdmin, { from: superAdmin }),
                "Super admin cannot be registered as an admin"
            );
        });

        it("should not allow re-registering an already active admin", async () => {
            await expectRevert(
                adminManagement.registerNewAdmin(admin1, { from: superAdmin }),
                "Admin already active or resigned"
            );
        });

        it("should disable an admin access instantly", async () => {
            await adminManagement.disableAdminAccess(admin1, 0, { from: superAdmin });
            const admin = await adminManagement.admins(admin1);
            assert.equal(admin.status.toString(), "2"); // Fired
        });

        it("should disable an admin access at a future time", async () => {
            await adminManagement.registerNewAdmin(admin2, { from: superAdmin });
            const futureTime = (await time.latest()).add(time.duration.seconds(10));
            await adminManagement.disableAdminAccess(admin2, futureTime, { from: superAdmin });

            const admin = await adminManagement.admins(admin2);
            assert.equal(admin.status.toString(), "3"); // Resigned
            assert(admin.disableTime.gt((await time.latest()).toString())); // Check if disableTime is in the future
        });

        it("should cancel an admin's resignation", async () => {
            await adminManagement.cancelResignation(admin2, { from: superAdmin });
            const admin = await adminManagement.admins(admin2);
            assert.equal(admin.status.toString(), "1"); // Active
            assert.equal(admin.disableTime.toString(), "0");
        });
    });

    describe("Finalization of Disabled Admins", () => {
        it("should finalize the disable process after the scheduled time", async () => {
            const futureTime = (await time.latest()).add(time.duration.seconds(10));
            await adminManagement.disableAdminAccess(admin2, futureTime, { from: superAdmin });

            // Fast forward time
            await time.increase(time.duration.seconds(11));
            await adminManagement.finalizeDisable({ from: superAdmin });

            const admin = await adminManagement.admins(admin2);
            assert.equal(admin.status.toString(), "2"); // Fired
        });
    });

    describe("Admin View Functions", () => {
        it("should return correct admin status", async () => {
            const isAdmin1 = await adminManagement.isAdmin(admin1);
            assert.equal(isAdmin1, false, "Admin1 should not be active or resigned");

            const isAdmin2 = await adminManagement.isAdmin(admin2);
            assert.equal(isAdmin2, false, "Admin2 should be fired");
        });

        it("should return correct super admin status", async () => {
            const isSuperAdmin = await adminManagement.isSuperAdmin(superAdmin);
            assert.equal(isSuperAdmin, true, "Super admin should return true");
        });
    });
});
